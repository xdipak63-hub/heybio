
import { useState } from "react";
import {
  Form,
  useNavigation
} from "react-router";

import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Trash2,
  X
} from "lucide-react";

import type {
  CreatorLink
} from "../../lib/validation/links.schema";

type LinkEditorProps = {
  links: CreatorLink[];
  error?: string | null;
};

function LinkFields({
  link,
  onCancel
}: {
  link?: CreatorLink;
  onCancel?: () => void;
}) {
  const editing = Boolean(link);

  return (
    <Form
      method="post"
      className="studio-link-form"
    >
      <input
        type="hidden"
        name="intent"
        value={editing ? "update" : "create"}
      />

      {link && (
        <input
          type="hidden"
          name="id"
          value={link.id}
        />
      )}

      <label>
        Link title
        <input
          name="title"
          defaultValue={link?.title ?? ""}
          placeholder="My latest project"
          maxLength={100}
          required
        />
      </label>

      <label>
        Destination URL
        <input
          name="url"
          type="url"
          defaultValue={link?.url ?? ""}
          placeholder="https://example.com"
          maxLength={2048}
          required
        />
      </label>

      <label>
        Short description (optional)
        <input
          name="description"
          defaultValue={link?.description ?? ""}
          placeholder="A little more about this link"
          maxLength={200}
        />
      </label>

      <div className="studio-link-form__actions">
        <button
          type="submit"
          className="button button--dark"
        >
          {editing ? "Save changes" : "Add link"}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="studio-text-button"
          >
            Cancel
          </button>
        )}
      </div>
    </Form>
  );
}

function LinkCard({
  link,
  index,
  total
}: {
  link: CreatorLink;
  index: number;
  total: number;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <article className="studio-link-card">
      <div className="studio-link-card__content">
        <div className="studio-link-card__icon">
          <ExternalLink size={19} />
        </div>

        <div className="studio-link-card__info">
          <div className="studio-link-card__title">
            <h3>{link.title}</h3>
            {!link.is_active && (
              <span className="studio-status">
                Hidden
              </span>
            )}
          </div>

          <p className="studio-link-card__url">
            {link.url}
          </p>

          {link.description && (
            <p className="studio-link-card__description">
              {link.description}
            </p>
          )}
        </div>
      </div>

      <div className="studio-link-card__actions">
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="studio-icon-button"
          aria-label={`Edit ${link.title}`}
        >
          {editing ? (
            <X size={17} />
          ) : (
            <Pencil size={17} />
          )}
        </button>

        <Form method="post">
          <input
            type="hidden"
            name="intent"
            value="toggle"
          />
          <input
            type="hidden"
            name="id"
            value={link.id}
          />
          <input
            type="hidden"
            name="active"
            value={link.is_active ? "false" : "true"}
          />
          <button
            type="submit"
            className="studio-icon-button"
            aria-label={
              link.is_active
                ? `Hide ${link.title}`
                : `Show ${link.title}`
            }
          >
            {link.is_active ? (
              <Eye size={17} />
            ) : (
              <EyeOff size={17} />
            )}
          </button>
        </Form>

        <Form method="post">
          <input
            type="hidden"
            name="intent"
            value="move"
          />
          <input
            type="hidden"
            name="id"
            value={link.id}
          />
          <input
            type="hidden"
            name="direction"
            value="up"
          />
          <button
            className="studio-icon-button"
            type="submit"
            disabled={index === 0}
            aria-label={`Move ${link.title} up`}
          >
            <ArrowUp size={17} />
          </button>
        </Form>

        <Form method="post">
          <input
            type="hidden"
            name="intent"
            value="move"
          />
          <input
            type="hidden"
            name="id"
            value={link.id}
          />
          <input
            type="hidden"
            name="direction"
            value="down"
          />
          <button
            className="studio-icon-button"
            type="submit"
            disabled={index === total - 1}
            aria-label={`Move ${link.title} down`}
          >
            <ArrowDown size={17} />
          </button>
        </Form>

        <Form
          method="post"
          onSubmit={(event) => {
            if (
              !window.confirm(
                `Delete "${link.title}" permanently?`
              )
            ) {
              event.preventDefault();
            }
          }}
        >
          <input
            type="hidden"
            name="intent"
            value="delete"
          />
          <input
            type="hidden"
            name="id"
            value={link.id}
          />
          <button
            type="submit"
            className="studio-icon-button studio-icon-button--danger"
            aria-label={`Delete ${link.title}`}
          >
            <Trash2 size={17} />
          </button>
        </Form>
      </div>

      {editing && (
        <div className="studio-link-card__editing">
          <LinkFields
            link={link}
            onCancel={() => setEditing(false)}
          />
        </div>
      )}
    </article>
  );
}

export default function LinkEditor({
  links,
  error
}: LinkEditorProps) {
  const [adding, setAdding] = useState(false);
  const navigation = useNavigation();

  return (
    <section className="studio-editor">
      <div className="studio-editor__heading">
        <div>
          <span className="eyebrow">
            YOUR LINKS
          </span>
          <h2>
            Everything you share.
          </h2>
          <p>
            Add, organize and control what people see.
          </p>
        </div>

        <button
          type="button"
          className="button button--dark"
          onClick={() => setAdding((v) => !v)}
        >
          {adding ? (
            <X size={18} />
          ) : (
            <Plus size={18} />
          )}
          {adding ? "Close" : "Add link"}
        </button>
      </div>

      {error && (
        <div
          className="auth-error"
          role="alert"
        >
          {error}
        </div>
      )}

      {adding && (
        <div className="studio-create-card">
          <h3>Add something new</h3>
          <LinkFields
            onCancel={() => setAdding(false)}
          />
        </div>
      )}

      {navigation.state === "submitting" && (
        <p className="studio-saving" role="status">
          Saving changes...
        </p>
      )}

      {links.length === 0 ? (
        <div className="studio-empty">
          <div className="studio-empty__symbol">
            ✳
          </div>
          <h3>Your world starts with one link.</h3>
          <p>
            Add your first destination to begin building
            your HEYBIO.
          </p>
        </div>
      ) : (
        <div className="studio-links-list">
          {links.map((link, index) => (
            <LinkCard
              key={link.id}
              link={link}
              index={index}
              total={links.length}
            />
          ))}
        </div>
      )}
    </section>
  );
}
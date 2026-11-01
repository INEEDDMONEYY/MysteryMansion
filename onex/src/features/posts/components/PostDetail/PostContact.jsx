// 📞 Post Contact — masked until a signed-in member clicks to reveal.
import {
  ContactRevealNotice,
  ContactValue,
  useContactReveal,
} from "@/shared/components/Contact/ContactReveal";

function ContactField({ label, field, masked, state, hasValue }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <div className="mt-1 break-all text-sm">
        {hasValue ? (
          <ContactValue field={field} masked={masked} state={state} />
        ) : (
          <span className="italic text-gray-400">Not provided</span>
        )}
      </div>
    </div>
  );
}

export default function PostContact({
  userId = "",
  phoneMasked = "",
  emailMasked = "",
  ownContact = null,
}) {
  const state = useContactReveal(userId, ownContact);
  const hasPhone = Boolean(phoneMasked || ownContact?.phoneNumber);
  const hasEmail = Boolean(emailMasked || ownContact?.email);

  return (
    <section className="border-b border-gray-200 py-6">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl font-semibold text-pink-500">
          Contact
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <ContactField label="Phone" field="phone" masked={phoneMasked} state={state} hasValue={hasPhone} />
          <ContactField label="Email" field="email" masked={emailMasked} state={state} hasValue={hasEmail} />
        </div>

        <div className="mt-3">
          <ContactRevealNotice state={state} />
        </div>
      </div>
    </section>
  );
}
